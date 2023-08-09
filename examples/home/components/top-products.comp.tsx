import { Image } from "core/components/image/image.comp.js";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ContextDataWithStore } from "src/core/models/context-with-store.model.js";
import { RootState } from "src/redux/create-store.js";
import { fetchTopProducts } from "../home.redux.js";

const TopProducts = (props: TopProductsProps) => {
  return (
    <>
      <h1>Top Products</h1>
      <div className="d-flex flex-row flex-wrap" data-test-id="top-products">
        {props.topProducts.map((product, idx) => {
          return (
            <div className={`card productCard`} key={idx}>
              <Image src={product.image} className="card-img-top" alt="..." />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <Link to={`/product/detail/${product.id}`} className="btn btn-primary">
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export interface TopProductsProps extends ReturnType<typeof mapStateToProps> {}
const mapStateToProps = (state: RootState) => {
  return {
    topProducts: state.home.topProducts,
  };
};
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(TopProducts);

export function loadData(ctx: ContextDataWithStore) {
  return ctx.store.dispatch(fetchTopProducts());
}
