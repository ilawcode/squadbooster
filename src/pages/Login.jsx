import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowRight } from 'lucide-react';

const Login = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await login(name);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
            alert('Giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <Rocket size={32} />
                    </div>
                    <span className="login-logo-text">SquadBooster</span>
                </div>

                <h1 className="login-title">Hoş Geldin! 👋</h1>
                <p className="login-subtitle">
                    Takım ritüellerini ve aksiyonlarını takip etmek için isminle giriş yap.
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Adın Soyadın</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Örn: Ahmet Yılmaz"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full justify-between group"
                        disabled={loading || !name.trim()}
                    >
                        <span>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</span>
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
