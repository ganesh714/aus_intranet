import React from 'react';
import RenderHome from "../render-content/render-home";
import Content from "../Content/Content";
import Add from "../Icon/Icon";
import { Link, useNavigate } from 'react-router-dom';
import './Officers.css'; // Rename to Officers.css if you rename the file

function Officers() {
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

export default Officers;