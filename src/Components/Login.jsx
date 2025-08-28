import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../Styles/auth.css";

export default function Login() 
{
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => 
    {
    e.preventDefault();
    try 
    {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success("Login successful! 🎉");
      navigate("/dashboard"); 
    }
    catch (err) 
    {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">

        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          
          <label>Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

