/*
  TODO:
  * Support for
	- expanding and collapsing the form
	  - forcing the form to never collapse
	  - setting the forms initial state to expanded
  * Style the form
*/
L.Control.Form = L.Control.extend({
	includes: L.Mixin.Events,

	options: {
		position: 'topright',
		showLabels: false,
		submitLabel: "Ok",
		header: undefined
	},

	initialize: function(formDef, options){
		L.Util.setOptions(this, options);
		this._formDef = formDef;
	},

	onAdd: function(map){
		this._fields = [];
		return this._initLayout();
	},

	_initLayout: function(){
		var className = 'leaflet-control-form'
		,   container = L.DomUtil.create('div', className);

		this._labelClassName = className + '-label'
			+ (this.options.showLabels ? '' : ' hidden');

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		container.appendChild(this._initForm());

		return container;
	},

	_initForm: function(){
		var form = this._form = L.DomUtil.create('form', "")
		,   fieldset = L.DomUtil.create('fieldset', "", form);

		if(this.options.header){
			L.DomUtil
				.create('legend', "", fieldset)
				.appendChild(document.createTextNode(this.options.header));
		}

		// Build up form
		for(var name in this._formDef){
			var fieldDef = this._formDef[name];
			this._createLabel(name, fieldDef.label, fieldset);
			var field = this._createField(name, fieldDef , fieldset);
			this._fields.push(field);
		}

		this._createField("submit"
						  , {type: "submit", value: this.options.submitLabel}
						  , fieldset);

		L.DomEvent.on(form, 'submit', this._submit, this);
		return form;
	},

	_createLabel: function(name, label, container){
		var label = L.DomUtil.create('label', this._labelClassName, container);
		label.setAttribute('for', name);
		label.appendChild(document.createTextNode(label+':'));
	},

	_createField: function(name, def, container){
		var field;

		switch(def.type){
		case "textarea":
			field = L.DomUtil.create('textarea', "", container);
			if(def.value){
				field.appendChild(document.createTextNode(def.value));
			}
			break;
		case "select":
			field = L.DomUtil.create('select', "", container);
			var opt = L.DomUtil.create('option', "", field);
			opt.appendChild(document.createTextNode(def.label));
			for(var key in def.options){
				opt = L.DomUtil.create('option', "", field);
				opt.setAttribute('value', key);
				if(key == def.value){
					opt.setAttribute('selected',"");
				}
				opt.appendChild(document.createTextNode(def.options[key]));
			}
			break;
		default:
			field = L.DomUtil.create('input', "", container);
			field.setAttribute('type', def.type);
			if(def.value){
				field.setAttribute('value', def.value);
			}
		}
		field.setAttribute('placeholder', def.label);
		field.setAttribute('name', name);
		return field;
	},

	_submit: function(e){
		var data = { }, i;
		L.DomEvent.stop(e);

		// Collect data
		for(i=0; i < this._fields.length; i++){
			var field = this._fields[i];
			data[field.name] = field.value;
		}

		this.fire('submit', { data:data } );
		return false;
	}
});
