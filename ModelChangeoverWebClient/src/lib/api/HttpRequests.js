  // @ts-nocheck
const handleRejectedResponse = async (error) => {
    console.error(error);
    let message = error.message || `${error.status}: ${error.statusText}`;

    const processJson = (json) => {
        console.debug("JSON error from API", json);
        if (json.hasOwnProperty('errors')) {
            let message = json.title;
            for (let index in json.errors) {
                message += `\n- ${json.errors[index]}`;
            }
            return message;
        }
        return json.message;
    };

    const processText = (text) => {
        console.debug("Text error from API", text);
        return text;
    };

    if (typeof error.json === "function") {
        let isJSON = error.headers.get('content-type').includes('application/json');
        message = await (isJSON ? error.json().then(processJson) : error.text().then(processText)).catch(async genericError => {
            console.debug("Generic error from API", genericError);
            return `${error.status}: ${error.statusText}`;
        });
    }
    return Promise.reject(message);
};

const getOptions = (method, data = null) => {
    const headers = { "Access-Control-Expose-Headers": "Content-Length", "Content-Type": "application/json" };
    const options = ({ method: method, headers: headers, mode: 'cors' });
    return data == null ? options : { ...options, body: JSON.stringify(data) }
}

    const toQueryString = (params) => {
        const esc = encodeURIComponent;
        const entries = Object.entries(params)
            .filter(([k, v]) => v !== undefined && v !== null && v !== '');
        
        if (entries.length === 0) return '';
        
        return '?' + entries
            .map(([k, v]) => `${esc(k)}=${esc(v)}`)
            .join('&');
    };
    
const HttpRequest = (function () {
    const httpRequest = async (method, url, data = null) => {
        console.debug("method", method);
        console.debug("url", url);
        console.debug("data", data);

        return fetch(url, getOptions(method, data))
            .then(response => {
                console.debug("response", response);
                if (!response.ok) {
                    return Promise.reject(response);
                }

                const contentType = response.headers.get('content-type') || '';

                // Sin contenido (204 No Content, etc.)
                if (response.status === 204) {
                    return null;
                }

                // Si es JSON
                if (contentType.includes('application/json')) {
                    return response.json().then(json => {
                        // Si tu API viene envuelta en { data: ... } lo sigues soportando
                        if (json && Object.prototype.hasOwnProperty.call(json, 'data')) {
                            return json.data;
                        }
                        // Si no tiene "data", regresa el JSON tal cual (caso /api/info)
                        return json;
                    });
                }

                // Si no es JSON, asumimos texto (caso /api/health => "Healthy")
                return response.text();
            })
            .catch(handleRejectedResponse);
    };

    return {
        get: async (url) => httpRequest('GET', url),
        put: async (url, data) => httpRequest('PUT', url, data),
        patch: async (url, data) => httpRequest('PATCH', url, data),
        post: async (url, data) => httpRequest('POST', url, data),
        delete: async (url, data) => httpRequest('DELETE', url, data),
    };
})();

export const ChangeoverApi = (function (apiUrl) {
    //apiUrl = 'http://localhost:5063';
    return {
        getApiInfo: () =>
            HttpRequest.get(`${apiUrl}/api/info`),
        getHealth: () =>
            HttpRequest.get(`${apiUrl}/api/health`),
        getLine: (lineCode) =>
            HttpRequest.get(`${apiUrl}/api/lines/${lineCode}`),
        getWorkOrderByLineID: (lineID) =>
            HttpRequest.get(`${apiUrl}/api/workorders?lineID=${lineID}`),
        getGamma: (lineCode, partNo) =>
            HttpRequest.get(`${apiUrl}/api/lines/${lineCode}/gamma/${partNo}`),
        applyChangeover: (lineCode) =>
            HttpRequest.put(`${apiUrl}/api/lines/${lineCode}/codew`, { }),
        GetWorkOrderAvailablesByLineID: (lineID) =>
            HttpRequest.get(`${apiUrl}/api/GetWorkOrderAvailablesByLineID/${lineID}`),
        UpdateProductionLineStatus: (lineCode, patch) =>
            HttpRequest.patch(`${apiUrl}/api/ProductionLineStatus/Update/${encodeURIComponent(lineCode)}`+ toQueryString(patch)),
    };
})("http://mxsrvapps.gt.local/gtt/services/changeovers");

export const CommonApi = (function (apiUrl) {
    //apiUrl = 'http://localhost:5160';
    return {
        getApiInfo: () =>
            HttpRequest.get(`${apiUrl}/api/info`),
        
        getHealth: () =>
            HttpRequest.get(`${apiUrl}/api/health`),

        UpdateGama: async (ogpartNo,icpartNo,oglineCode,iclineCode) =>
        HttpRequest.put(`${apiUrl}/api/lines/updategama/partno/${ogpartNo}/${icpartNo}/lineCode/${oglineCode}/${iclineCode}`),

        DeleteGama: async (ogpartNo,icpartNo,oglineCode,iclineCode) =>
        HttpRequest.put(`${apiUrl}/api/lines/deletegama/partno/${ogpartNo}/${icpartNo}/lineCode/${oglineCode}/${iclineCode}`),
    };
})("http://mxsrvapps/gtt/services/common");