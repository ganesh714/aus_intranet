import React from 'react';
import RenderHome from "../render-content/render-home";  // Fixing the import name
import Content from "../Content/Content";
import  Add from "../Icon/Icon";
import { Link, useNavigate } from 'react-router-dom';
import './Dean.css';

function Dean() {
    return (
        <>
            <RenderHome />  {/* Using the correct component name */}
            <Content />
            <Link to="/add-file">
                    <div className="plus-div">
                        <Add />
                    </div>
                </Link>
        </>
    );
}

export default Dean;