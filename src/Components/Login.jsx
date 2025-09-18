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
      {/* Decorative SVG shapes for background */}
      <svg className="bg-shape bg-shape1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M44.8,-67.2C56.7,-59.2,63.7,-44.2,68.2,-29.2C72.7,-14.2,74.7,0.8,70.2,14.7C65.7,28.6,54.7,41.4,41.2,48.7C27.7,56,11.8,57.8,-2.7,60.7C-17.2,63.6,-34.4,67.6,-46.2,61.1C-58,54.6,-64.4,37.6,-67.2,21.1C-70,4.6,-69.2,-11.4,-62.7,-23.2C-56.2,-35,-44,-42.6,-31.7,-50.7C-19.4,-58.8,-7,-67.4,7.2,-76.1C21.4,-84.8,37.7,-93.2,44.8,-67.2Z" transform="translate(100 100)" /></svg>
      <svg className="bg-shape bg-shape2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#38bdf8" d="M38.2,-62.2C51.2,-54.2,63.2,-44.2,67.2,-31.2C71.2,-18.2,67.2,-2.2,62.2,13.8C57.2,29.8,51.2,45.8,39.2,54.8C27.2,63.8,9.2,65.8,-5.8,65.8C-20.8,65.8,-41.8,63.8,-54.8,54.8C-67.8,45.8,-72.8,29.8,-74.8,13.8C-76.8,-2.2,-75.8,-18.2,-67.8,-31.2C-59.8,-44.2,-44.8,-54.2,-29.8,-62.2C-14.8,-70.2,1.2,-76.2,16.2,-75.2C31.2,-74.2,45.2,-66.2,38.2,-62.2Z" transform="translate(100 100)" /></svg>
      <svg className="bg-shape bg-shape3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#f59e42" d="M44.8,-67.2C56.7,-59.2,63.7,-44.2,68.2,-29.2C72.7,-14.2,74.7,0.8,70.2,14.7C65.7,28.6,54.7,41.4,41.2,48.7C27.7,56,11.8,57.8,-2.7,60.7C-17.2,63.6,-34.4,67.6,-46.2,61.1C-58,54.6,-64.4,37.6,-67.2,21.1C-70,4.6,-69.2,-11.4,-62.7,-23.2C-56.2,-35,-44,-42.6,-31.7,-50.7C-19.4,-58.8,-7,-67.4,7.2,-76.1C21.4,-84.8,37.7,-93.2,44.8,-67.2Z" transform="translate(100 100)" /></svg>
      <div className="auth-box">
        <div className="user-icon"></div>
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="current-password"
          />
          <button type="submit">Login</button>
        </form>
        <div style={{width: '100%', textAlign: 'center', margin: '1rem 0', color: '#aaa', fontSize: 14}}>
          — or —
        </div>
        <p style={{marginBottom: 0}}>
          Don’t have an account? <Link to="/register" style={{color: '#4a90e2', textDecoration: 'underline'}}>Register</Link>
        </p>
      </div>
    </div>
  );
}

