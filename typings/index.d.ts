import { GetInitialProps } from "core/models/common.model.js";
import { ApiResponse, SHOW_LOADER } from "core/services/http-client.js";
import NodeCache from "node-cache";
import React from "react";
import { PageData } from "src/core/models/page-data.js";
import { Toaster } from "src/core/models/toaster.model.js";
import { MetaJson } from "src/ssr/functions/get-webpack-build-meta-json.js";

declare global {
    interface Window {
        pageProps?: ApiResponse<PageData>;
        __SSRDATA__: any;
    }
    interface WindowEventMap {
        [SHOW_LOADER]: CustomEvent<boolean>;
        ["toast"]: CustomEvent<Toaster>;
    }
    class SsrComponent<P = {}, S = {}> extends React.Component<P, S> {
        getInitialProps: GetInitialProps;
    }

    var staticPageCache: NodeCache;
    var createRequire: any;
    /**
     * metaJson will available only on server side  
     * metaJson have all chunk css with main Js and main css.  
     * chunk key mapped to webpackChunkName
     */
    var metaJson: MetaJson;
}

