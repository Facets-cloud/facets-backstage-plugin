import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  CatalogTable,
  CatalogTableColumnsFunc,
  CatalogTableRow,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { SettingsLayout, UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';
import { githubAuthApiRef } from '@backstage/core-plugin-api';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
  TableProps,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { SettingsPage } from '@facets-cloud/backstage-plugin';

import { Typography } from '@material-ui/core';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { visuallyHidden } from '@mui/utils';

const customActions: TableProps<CatalogTableRow>['actions'] = [
  ({ entity }) => {
    const url = 'https://backstage.io/';
    const title = `View - ${entity.metadata.name}`;

    return {
      icon: () => (
        <>
          <Typography style={visuallyHidden}>{title}</Typography>
          <OpenInNew fontSize="small" />
        </>
      ),
      tooltip: title,
      disabled: !url,
      onClick: () => {
        if (!url) return;
        window.open(url, '_blank');
      },
    };
  },
];

const app = createApp({
  apis,
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  components: {
    SignInPage: props => (
      <SignInPage
        {...props}
        auto
        provider={{
          id: 'github-auth-provider',
          title: 'GitHub',
          message: 'Sign in using GitHub',
          apiRef: githubAuthApiRef,
        }}
      />
    ),
  },
});
const myColumnsFunc: CatalogTableColumnsFunc = entityListContext => {
  if (entityListContext.filters.kind?.value === 'MyKind') {
    return [
      CatalogTable.columns.createNameColumn(),
      CatalogTable.columns.createOwnerColumn(),
    ];
  }

  return CatalogTable.defaultColumnsFunc(entityListContext);
};

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route
      path="/catalog"
      element={
        <CatalogIndexPage columns={myColumnsFunc} actions={customActions} />
      }
    />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />}>
      <RequirePermission permission={catalogEntityCreatePermission}>
        <SettingsLayout.Route
          path="/facets-cloud"
          title="Facets.Cloud"
          children={<SettingsPage />}
        />
      </RequirePermission>
    </Route>
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
