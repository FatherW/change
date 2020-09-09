
import {PolymerElement, html} from '@polymer/polymer';

// loadElement("../vaadin-dialog/vaadin-dialog.js");
// loadElement("dz-login.js");

	  
  
class dzDazzle extends Polymer.Element {
	 static get template() {
		return html`
				hello, world.		
		`;
	  }
	
	static get is() {
          return 'dz-dazzle';
	}

	constructor() {
		super();


			let that = this;


			if (Polymer.dzLicense['token'] !==""){
				// this._login();

			}

	}

		_login() {
			console.log('Login');
			let shadow = this.shadowRoot;
			let that = this;
			let loginUrl = "https://d8fz9pfue5.execute-api.ap-northeast-1.amazonaws.com/prod/newMiscDazzleFunction";
			let params = {
				"action": "loginByToken", "token": Polymer.dzLicense['token']
			};
			Polymer.postData(loginUrl, params).then(res => {
				if (res.code > 0) {
					let uid = res.resolve['uid'];
					let user = res.resolve;
					user['thisPage'] = this.thisPage;
					store.set('user', res.resolve);
					// store.set('editMode', 'admin');
					store.set('thisPage', this.thisPage);
					console.log('Res',res.resolve);
					// location.reload();
					let dialog=this.shadowRoot.querySelector('#dialog');
					Polymer.popup(dialog,'dz-dazzle','dz-history','90%','90%');					
				}
				else {
					alert('登入錯誤');
				}
			});
		}
		ready(){
			super.ready();
			let that = this;
			const logo = this.querySelector('#dz-logo');
			console.log('Logo',logo,Polymer.userType);
			if (Polymer.userType==="professional") {
				logo.setAttribute('hide','');

				document.addEventListener('keypress',e=>{
					console.log('e',e);
					if (e.ctrlKey){
					if (e.shiftKey){

						switch(e.code){

							case 'KeyL':
							console.log('Logo');
							that.login();
							break;

							}
						}
					}
				});
			}
			let json2 = { 'component': 'dz-history', 'width': '90%', 'height': '80%' };

				// button2.addEventListener('click', e => {
				//     document.dispatchEvent(new CustomEvent('dz-popup', { 'detail': json2 }));
				// });

		}
		login(){
			const shadow = this.shadowRoot;
			const dialog = shadow.querySelector('vaadin-dialog#login');
			// dialog.opened = true;		
			Polymer.popup(dialog,'dz-dazzle','dz-login','480px','800px');
		}

  }	

  customElements.define('dz-dazzle', dzDazzle);



