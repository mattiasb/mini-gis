/*
  TODO:
  * Collect the data and return with the submit-event
  * Support for 
    - select fields
    - setting a header / legend
	- setting the submit button text
	- expanding and collapsing the form
	- forcing the form to never collapse
	- setting the forms initial state to expanded
  * Style the form
*/
L.Control.Form = L.Control.extend({
	includes: L.Mixin.Events,

	options: {
		position: 'topright',
		showLabels: false
	},

	initialize: function(formDef, options){
		L.Util.setOptions(this, options);
		this._formDef = formDef;
	},
	
	onAdd: function(map){
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
		var form = this._form = L.DomUtil.create('form', "");
		
		// Build up form
		for(var name in this._formDef){
			var fieldDef = this._formDef[name];
			this._createLabel(name, fieldDef.label, form);
			this._createField(name, fieldDef      , form);
		}
		
		this._createField("submit", {type: "submit", value:"Ok"}, form);

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
			throw new Error("No support for selects yet!");
		default:
			field = L.DomUtil.create('input', "", container);
			field.setAttribute('type', def.type);
			if(def.value){
				field.setAttribute('value', def.value);
			}
		}
		field.setAttribute('placeholder', def.label);
		field.setAttribute('name', name);
	},

	_submit: function(e){
		L.DomEvent.stop(e);
		var data = {test:"lol"};

		// Collect data
		
		this.fire('submit', data);
		return false;
	}
});