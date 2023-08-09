import { logout as logoutAction } from "examples/auth/auth.redux.js";
import { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ROUTE_LOGIN } from "src/const.js";
import { withRouter, WithRouterProps } from "src/core/hoc/with-routes.hoc.js";
import { CommonService } from "src/core/services/common.service.js";
import { AppDispatch, RootState } from "src/redux/create-store.js";

class HeaderComp extends Component<HeaderProps> {
  public logout() {
    this.props.logout();
    CommonService.logout();
    this.props.router.navigate(ROUTE_LOGIN);
  }

  public componentDidUpdate(prevProps: HeaderProps) {
    if (prevProps.isLoggedIn !== this.props.isLoggedIn && !this.props.isLoggedIn) {
      this.props.router.navigate(ROUTE_LOGIN);
    }
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light" data-test-id="header">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" data-test-id="navbar">
            Navbar
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            id="mobileMenuButton"
            aria-label="Hamburger menu"
            role="button"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {this.props.header?.links.map((link, idx) => (
                <li className="nav-item" key={idx}>
                  <Link className="nav-link active" to={link.url} data-test-id={link.url}>
                    {link.text}
                  </Link>
                </li>
              ))}

              <li className="nav-item">
                {!this.props.isLoggedIn && (
                  <Link className="nav-link" to={ROUTE_LOGIN} data-test-id="login-link">
                    Login
                  </Link>
                )}
                {this.props.isLoggedIn && (
                  <p className="nav-link" onClick={() => this.logout()} data-test-id="logout-btn">
                    Logout
                  </p>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    header: state.app.header,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    logout: () => dispatch(logoutAction()),
  };
};

export const Header = connect(mapStateToProps, mapDispatchToProps)(withRouter(HeaderComp));

export interface HeaderProps
  extends WithRouterProps,
    ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}
