import { useState, useEffect, react } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { register } from "../app/action/auth.action.js";
function Register() {
  const [Username, setUsername] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submitForm = async () => {
    if (Username == "" || Email == "" || Password == "") {
      return;
    }

    const res = await dispatch(
      register({
        username: Username,
        email: Email,
        password: Password,
      }),
    );
    setUsername("");
    setEmail("");
    setPassword("");
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/chat");
    }
  };
  useEffect(() => {
    const check = localStorage.getItem("token");
    console.log(check);
    if (check) navigate("/chat");
  }, []);
  return (
    <>
      <div className="container">
        <div className="main-div">
          <div className="left-div">
            <h1 className="heading">Sign in</h1>
            <div className="icons-div">
              <i class="icons  fa-brands fa-facebook"></i>

              <i class="icons fa-brands fa-google"></i>

              <i class="icons fa-brands fa-instagram"></i>
            </div>
            <p>or use your account</p>

            <div className="input-div">
              <input
                className="input"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                value={Username}
                placeholder="Username"
              />
              <input
                className="input"
                value={Email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Email"
              />
              <input
                type="password"
                value={Password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="input"
                placeholder="Password"
              />
            </div>
            <p className="forget-p">forget your password ?</p>
            <div onClick={submitForm} className="signIn-div">Sign In</div>
          </div>
          <div className="right-div">
            <h1>Hello, Friend!</h1>
            <p>Enter you personal details and start journey with us.</p>
            <div
              onClick={() => {
                navigate("/login");
              }}
              className="signUp-div"
            >
              Sign Up
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Register;
