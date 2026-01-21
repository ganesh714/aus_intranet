import React from 'react';
import RenderHome from "../render-content/render-home";
import Content from "../Content/Content";

const FacultyDashboard = ({ theme, setTheme }) => {
    return (
        <>
            <RenderHome theme={theme} setTheme={setTheme} />
            <Content />
        </>
    );
};

export default FacultyDashboard;