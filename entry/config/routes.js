import React from 'react';import Async from '../components/Async';
export default [{path:'/',
component:(props) => <Async {...props} getComponent={() => import('../../src/pages/Test')} />},
{path:'/2333',
component:(props) => <Async {...props} getComponent={() => import('../../src/pages/Test')} />}]