import { createDevApp } from '@backstage/dev-utils';
import { facetsCloudPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(facetsCloudPlugin)
  .render();
