import React from 'react';
import RenderHome from "../render-content/render-home";  // Fixing the import name
import Content from "../Content/Content";
import  Add from "../Icon/Icon";
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
    return (
        <>
            <Content />
            <Link to="/add-file">
                    <div className="plus-div">
                        <Add />
                    </div>
                </Link>
        </>
    );
}

export default Admin;
