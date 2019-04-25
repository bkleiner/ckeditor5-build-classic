import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import LinkUI from '@ckeditor/ckeditor5-link/src/linkui';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

export default class WikiLink extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('link.wikilink.select', () => Promise.resolve("placeholder"));
	}

	static get requires() {
		return [LinkUI];
	}

	init() {
		const editor = this.editor;

		this.ui = editor.plugins.get(LinkUI);
		this.linkFormView = this.ui.formView;
		this.linkActionsView = this.ui.actionsView;
		this.button = this._createButton();
		this.balloon = editor.plugins.get(ContextualBalloon);

		this.linkFormView.once('render', () => {
			this.button.render();
			this.linkFormView.registerChild(this.button);
			this.linkFormView.element.insertBefore(this.button.element, this.linkFormView.saveButtonView.element);
		});
	}

	_createButton() {
		const editor = this.editor;
		const button = new ButtonView(this.locale);
		const linkCommand = editor.commands.get('link');
		const linkConfig = editor.config.get('link.wikilink');

		button.set({
			label: 'Wiki link',
			withText: true,
			tooltip: true
		});

		button.bind('isEnabled').to(linkCommand);
		button.on('execute', () => {
			const label = new LabelView(this.locale);
			label.set({
				text: "Waiting",
			})

			this.balloon.add({
				view: label,
				position: this.ui._getBalloonPositionData()
			})

			linkConfig.select().then(link => {
				this.balloon.remove(label)
				this.linkFormView.urlInputView.value = `#wiki-<${link}>`;
			})
		});

		return button;
	}
}
