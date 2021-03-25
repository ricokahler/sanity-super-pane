import React, { createContext, useContext } from 'react';

const RouterContext = createContext<any>(null);

// https://github.com/sanity-io/demo-custom-workflow/blob/d00b0f73fbf8543724772802749bd846078075d6/app/lib/router/internalRouterContextTypeCheck.js#L1
function internalRouterContextTypeCheck(
  context: any,
  propName: any,
  componentName: any,
) {
  if (!context.__internalRouter) {
    throw new Error(
      'The router is accessed outside the context of a <RouterProvider>.' +
        ' No router state will be accessible and links will not go anywhere. To fix this,' +
        ` make sure ${componentName} is rendered in the context of a <RouterProvider /> element`,
    );
  }
}

// https://github.com/sanity-io/demo-custom-workflow/blob/d00b0f73fbf8543724772802749bd846078075d6/app/lib/router/provider.js
export class RouterProvider extends React.Component {
  static contextTypes = {
    __internalRouter: internalRouterContextTypeCheck,
  };

  render() {
    const router = this.context.__internalRouter;

    return (
      <RouterContext.Provider value={router}>
        {this.props.children}
      </RouterContext.Provider>
    );
  }
}

function useRouter() {
  return useContext(RouterContext);
}

export default useRouter;
