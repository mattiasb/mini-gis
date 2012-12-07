/*
 TODO:
 * Collapsing:
   - expanding and collapsing the form
   - forcing the form to never collapse
   - setting for the forms initial state to expanded/collapsed
 * Styling
 * A label column
   - real <label>'s for all but radio/checkbox (since made of many <input>'s)
 */

(function(L){

	L.control.form = function(def, options){
		return new L.Control.Form(def, options);
	};

	L.Control.Form = L.Control.extend({
		includes: L.Mixin.Events,

		options: {
			position: 'topright'
			, showLabels: false
			, submitLabel: "Submit"
			, header: undefined
		},

		initialize: function(formDef, options) {
			L.Util.setOptions(this, options);
			this._formDef = formDef;
		},

		onAdd: function(map) {
			this._fields = [];
			return this._initLayout();
		},

		addField: function(name, def) {
			// Special case radio buttons
			if(def.type === 'radio') {
				this._addRadio(name, def);
				return;
			}

			if(this.options.showLabels){
			// 	Add label here
			}
			var field = this._builder.create(name, def);
			if(field) {
				this._fields.push(field);
			}
		},

		_addRadio: function(name, def){
			if(this.options.showLabels){
			// 	Add label here
			}
			for(var label in def.values) {
				var newDef = L.Util.extend({}, def, {
					label: label,
					value:  def.values[label]
				});
				var field = this._builder.create(name, newDef);
				if(field) {
					this._fields.push(field);
				}
			}
		},

		_initLayout: function() {
			var className = 'leaflet-control-form'
			,   container = L.DomUtil.create('div', className);

			if (!L.Browser.touch) {
				L.DomEvent.disableClickPropagation(container);
			} else {
				L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
			}

			container.appendChild(this._initForm());

			return container;
		},

		_initForm: function() {
			var form = this._form = L.DomUtil.create('form', "")
			,   fieldset = L.DomUtil.create('fieldset', "", form)
			,   builder  = this._builder = new FormBuilder(fieldset);

			if(this.options.header){
				L.DomUtil
					.create('legend', "", fieldset)
					.appendChild(document.createTextNode(this.options.header));
			}

			// Build up form
			for(var name in this._formDef){
				// TODO: HasOwnPropery
				this.addField(name, this._formDef[name]);
			}
			L.DomUtil
				.create('button', "", fieldset)
				.appendChild(document.createTextNode(this.options.submitLabel));
			L.DomEvent.on(form, 'submit', this._submit, this);
			return form;
		},

		_submit: function(e){
			var data = { };
			L.DomEvent.stop(e);

			// Collect data
			for(var i in this._fields){
				var field = this._fields[i];
				if (!field.value || (
					(field.type === "radio" || field.type === "checkbox") && !field.checked) ){
					continue;
				}
				data[field.name] = field.value;
			}

			this.fire('submit', data );

			this._form.blur();

			return false;
		}
	});

	var FormBuilder = L.Class.extend({
		initialize: function(container){
			this._container = container;
		},

		createLabel: function(name, label, container){
			container = container || this._container;
			var elem = L.DomUtil.create('label', "", container);
			elem.setAttribute('for', name);
			elem.appendChild(document.createTextNode(label));
			return elem;
		},

		create: function(name, def) {
			var field, create = this[def.type];

			if(typeof create !== "function") {
				throw new Error("The type '" + def.type + "' isn't supported!");
			} else {
				field = create.call(this, name, def);
			}

			field.setAttribute('placeholder', def.label);
			field.setAttribute('name', name);

			for(var key in def.attributes) {
				// TODO: HasOwnPropery
				field.setAttribute(key, def.attributes[key]);
			}

			return field;
		},

		input: function(def, container){
			container = container || this._container;
			var field = L.DomUtil.create('input', "",container);

			field.setAttribute('type', def.type);
			if(def.value){
				field.setAttribute('value', def.value);
			}
			return field;
		},

		radio: function(name, def){
			var field = this.input(def, this.createLabel(name, def.label, this._container));
			if(def.checked){
				field.setAttribute('checked', 'checked');
			}
			return field;
		},

		textarea: function(name, def){
			var field = L.DomUtil.create('textarea', "", this._container);
			if(def.value){
				field.appendChild(document.createTextNode(def.value));
			}
			return field;
		},

		select: function(name, def){
			var field = L.DomUtil.create('select', "", this._container);
			var opt = L.DomUtil.create('option', "", field);
			opt.appendChild(document.createTextNode("— " + def.label + " —"));
			for(var label in def.values){
				// TODO: HasOwnPropery
				var value = def.values[label];
				opt = L.DomUtil.create('option', "", field);
				opt.setAttribute('value', value);
				if(value == def.value){
					opt.setAttribute('selected',"selected");
				}
				opt.appendChild(document.createTextNode(label));
			}
			return field;
		}
	});

})(typeof exports !== "undefined" ? exports : window.L);