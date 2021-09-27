import React from 'react';
import { Header, Icon, Menu } from 'semantic-ui-react';
import { views, GetMockContextSetterByKey, DebugContext } from './DebugContext.jsx';
import { useDispatch } from 'react-redux';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';

export default function DebugMenu() {

    const debugContext = React.useContext(DebugContext);
    const [currentView, setCurrentView] = GetMockContextSetterByKey(debugContext, "currentView");
    const dispatch = useDispatch();

    const toggleDebugMenu = () => { dispatch(INTERFACE_ACTIONS.DEBUG_toggleShowDebug()); }

    const getMenuItems = () => {
        return Object.keys(views).map(viewName => <Menu.Item content={views[viewName]} onClick={() => setCurrentView(views[viewName])} active={currentView === views[viewName]} />);
    }

    return (

        <Menu size="mini">
            <Menu.Item content={<Header content="Debug Panel" />} />
            {getMenuItems()}
            <Menu.Item position="right" content={<Icon name="close" size="large" className="m-0" />} onClick={toggleDebugMenu} />
        </Menu>

    )

}