import React from 'react';
import RenderHome from "../render-content/render-home"; 
import Content from "../Content/Content";
import  Add from "../Icon/Icon";
import { Link, useNavigate } from 'react-router-dom';
import './Leadership.css'; // Rename to Leadership.css if you rename the file

function Leadership() {
    return (
        <>
            <RenderHome /> 
            <Content />
            <Link to="/add-file">
                    <div className="plus-div">
                        <Add />
                    </div>
                </Link>
        </>
    );
}

export default Leadership;