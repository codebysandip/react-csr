import { logout as logoutAction } from "examples/auth/auth.redux";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchHeader } from "src/app.redux";
import { ROUTE_LOGIN } from "src/const";
import { useAppDispatch, useAppSelector } from "src/core/hook";
import { CommonService } from "src/core/services/common.service";

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const header = useAppSelector((state) => state.app.header);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    dispatch(fetchHeader());
  }, []);

  const logout = () => {
    dispatch(logoutAction());
    CommonService.logout();
    navigate(ROUTE_LOGIN);
  };

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
            {header?.links.map((link, idx) => (
              <li className="nav-item" key={idx}>
                <Link className="nav-link active" to={link.url} data-test-id={link.url}>
                  {link.text}
                </Link>
              </li>
            ))}

            <li className="nav-item">
              {!isLoggedIn && (
                <Link className="nav-link" to={ROUTE_LOGIN} data-test-id="login-link">
                  Login
                </Link>
              )}
              {isLoggedIn && (
                <p className="nav-link" onClick={() => logout()} data-test-id="logout-btn">
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
