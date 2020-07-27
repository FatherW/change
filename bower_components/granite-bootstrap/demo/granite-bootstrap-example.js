import {html, PolymerElement} from '../../polymer/polymer-element.js';
import '../../iron-icon/iron-icon.js';
import '../../iron-demo-helpers/demo-snippet.js';
import '../../iron-demo-helpers/demo-pages-shared-styles.js';
import '../../paper-styles/color.js';
import '../granite-bootstrap-all-min.js';

class GraniteBootstrapExample extends PolymerElement {
    static get template() {
        return html`
                <style include="granite-bootstrap-min"></style>
                <table class="table  table-hover">
                    <tr><th>Surname</th><th>Name</th></tr>
                    <template is="dom-repeat" items="{{people}}" as="person">
                      <tr>
                        <td>{{person.lastname}}</td>
                        <td>{{person.firstname}}</td>
                      </tr>
                    </template>
                </table>`;
    }
    static get properties() {
        return {
            people: {
                type: Array,
                value: function () {
                    return [
                        {firstname: "Jack", lastname: "Aubrey"},
                        {firstname: "Anne", lastname: "Elliot"},
                        {firstname: "Stephen", lastname: "Maturin"},
                        {firstname: "Emma", lastname: "Woodhouse"}
                    ]
                }
            }
        };
    }

    constructor() {
        super();
    }
}
customElements.define('granite-bootstrap-example', GraniteBootstrapExample);