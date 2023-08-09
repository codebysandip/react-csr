import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Image } from "src/core/components/image/image.comp.js";
import { InView } from "src/core/components/in-view/in-view.comp.js";
import { useAppDispatch } from "src/core/hook.js";
import { RootState } from "src/redux/create-store.js";
import "./home.comp.scss";
import HomeReducer, { fetchProducts } from "./home.redux.js";

const Home = (props: HomeProps) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchProducts());
  }, []);
  const pageData = props.pageData;
  return (
    <>
      <Helmet>
        <title>{pageData.seo?.title || "My Title"}</title>
        <body className="my-class" />
        {/* metaJson will available only on server side */}
        {process.env.IS_SERVER && <link href={metaJson["home"]} rel="stylesheet" />}
      </Helmet>
      <div className="d-flex flex-row flex-wrap min-vh-100" data-test-id="home-page">
        {pageData.products.map((product, idx) => {
          return (
            <div
              className={`card productCard`}
              key={idx}
              data-test-id={`product-card-${product.id}`}
            >
              <Image src={product.image} className="card-img-top" alt="..." />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <Link
                  to={`/product/detail/${product.id}`}
                  className="btn btn-primary"
                  data-test-id={`home-view-btn-${product.id}`}
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {/* test code for InView */}
      <InView testIdAttribute={{ "data-test-id": "top-products-in-view" }}>
        {(inView) =>
          inView ? (
            import("./components/top-products.comp.js")
          ) : (
            <div className="d-flex flex-row flex-wrap">
              {[1, 2, 3].map((val) => (
                <div className="productCard skeleton" key={val}></div>
              ))}
            </div>
          )
        }
      </InView>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    pageData: state.home.pageData,
  };
};
export default connect(mapStateToProps, {})(Home);

export interface HomeProps extends ReturnType<typeof mapStateToProps> {}

export const reducer = {
  home: HomeReducer,
};
