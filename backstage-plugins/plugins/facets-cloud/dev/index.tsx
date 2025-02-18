import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { facetsCloudPlugin, FacetsCloudPage } from '../src/plugin';

createDevApp()
  .registerPlugin(facetsCloudPlugin)
  .addPage({
    element: <FacetsCloudPage />,
    title: 'Root Page',
    path: '/facets-cloud',
  })
  .render();
