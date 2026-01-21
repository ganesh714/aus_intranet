import React from 'react';
import RenderHome from "../render-content/render-home";  // Fixing the import name
import Content from "../Content/Content";
import Add from "../Icon/Icon";
import { Link, useNavigate } from 'react-router-dom';
import './Hod.css';

function Hod({ theme, setTheme }) {
    return (
        <>
            <RenderHome theme={theme} setTheme={setTheme} />  {/* Using the correct component name */}
            <Content />
        </>
    );
}

export default Hod;
