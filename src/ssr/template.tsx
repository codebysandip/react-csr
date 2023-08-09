import { Component, ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { Helmet } from "react-helmet";
import { StaticRouter } from "react-router-dom/server.js";
import { ContextData } from "src/core/models/context.model.js";
import ReactSsrApp from "src/index.js";
import { ssrConfig } from "src/react-ssr.config.js";
import { CompModule } from "../core/models/route.model.js";

const chunkRegex = /[a-z-0-9]{2,}(\.chunk\.css)/;
/**
 * Base HTML template.
 * This component will use as index.html
 */
export class HtmlTemplate extends Component<HtmlTemplateProps> {
  public render() {
    const helmet = Helmet.renderStatic();
    const ssrDataScript = `window.__SSRDATA__ = ${JSON.stringify(this.props.ssrData)};`;
    const styleLinks = helmet.link.toString();
    const match = styleLinks.match(chunkRegex);
    if (!match) {
      // [TODO] if match not found then try to get page css through Request path
    }
    const helmetBody = helmet.bodyAttributes.toComponent();
    return (
      <html lang="en" {...helmet.htmlAttributes.toComponent()}>
        <head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <link href="/manifest.json" rel="manifest" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {(helmet.link.toComponent() as unknown as ReactElement[]).filter((el) => {
            return el.props.rel === "preload";
          })}
          <link href={metaJson["style.css"]} rel="stylesheet" />
          {(helmet.link.toComponent() as unknown as ReactElement[]).filter((el) => {
            return el.props.rel !== "preload";
          })}
          {helmet.style.toComponent()}
        </head>
        <body {...helmetBody}>
          {helmet.noscript.toComponent()}
          <div id="root" dangerouslySetInnerHTML={{ __html: this.props.html }}></div>
          <script dangerouslySetInnerHTML={{ __html: ssrDataScript }}></script>
          <script src={metaJson["client.js"]}></script>
          {helmet.script.toComponent()}
        </body>
      </html>
    );
  }
}

interface HtmlTemplateProps {
  ssrData: any;
  html: string;
}

/**
 * Get rendered HTML
 * @param module Module exported from page component
 * @param ctx {@link ContextData}
 * @param url url of request
 * @param isSSR flag for page will render on server or client
 * @returns
 */
export function getHtml(module: CompModule, ctx: ContextData, url: string, isSSR = true) {
  if (isSSR && ssrConfig.getSsrData) {
    ctx.ssrData = ssrConfig.getSsrData(ctx);
  }

  let innerHtml = "";
  if (isSSR) {
    innerHtml = renderToString(
      <StaticRouter location={url}>
        <ReactSsrApp module={module} ctx={ctx} />
      </StaticRouter>,
    );
  } else {
    innerHtml = renderToString(<module.default />);
  }
  let html = renderToString(
    <HtmlTemplate ssrData={ctx.ssrData || {}} html={innerHtml}></HtmlTemplate>,
  );
  html = `<!DOCTYPE html>${html}`;
  return html;
}
