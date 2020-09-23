import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'ag-grid-polymer';
/**
 * @customElement
 * @polymer
 */
class AgGridPolymerAppApp extends PolymerElement {
    static get template() {
        return html `
            <link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-grid.css">
            <link rel="stylesheet" href="../../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css">
        
            <ag-grid-polymer style="width: 100%; height: 350px;"
                             class="ag-theme-alpine"
                             rowData="{{rowData}}"
                             columnDefs="{{columnDefs}}"
                             on-first-data-rendered="{{firstDataRendered}}"
            ></ag-grid-polymer>
    `;
    }

    constructor() {
        super();

        this.columnDefs = [
            { headerName: "Make", field: "make", filter: true, sortable: true },
            { headerName: "Model", field: "model", filter: true, sortable: true },
            { headerName: "Price", field: "price", filter: true, sortable: true },
        ];

        this.rowData = [
            { make: "Toyota", model: "Celica", price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxter", price: 72000 }
        ];
    }

    firstDataRendered(params) {
        params.api.sizeColumnsToFit()
    }

    static get properties() {
        return {
            prop1: {
                type: String,
                value: 'ag-grid-polymer-app-app'
            }
        };
    }
}

window.customElements.define('ag-grid-polymer-app-app', AgGridPolymerAppApp);