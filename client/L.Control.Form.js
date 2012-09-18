L.Control.Form = L.Control.extend({
	include: L.Mixin.Events,

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
		var form = this._form = L.DomUtil.create('form')
		,   field;
		
		// Build up form
		for(var name in this._formDef){
			var fieldDef = this._formDef[name];
			// 
			this._createLabel(name, fieldDef.label, form);
			this._createField(name, fieldDef      , form);
		}
		
		L.DomEvent.on(form, 'submit', this._submit);
		return form;
	},

	_createLabel: function(name, label, container){
		var label = L.DomUtil
			.create('label', this._labelClassName, container);
		label.setAttribute('for', name);
		label.appendChild(document.createTextNode(label+':'));
	},

	_createField: function(name, def, container){
		var field = L.DomUtil.create('input', undefined, container);
		field.setAttribute('name', name);
		field.setAttribute('type', def.type);
		field.setAttribute('placeholder', def.label);
	},

	_submit: function(){
		var data = {};

		// Collect data
		
		this.fire('submit', data);
	}
});