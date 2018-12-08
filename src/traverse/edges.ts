import { Context, Quad } from 'feedbackfruits-knowledge-engine';

export const EdgesFactors: Edges = {
  factor: 1,
  // [Context.iris.$.Topic]: {
  //   factor: 1,
  //   [Context.iris.$.child]: { factor: 0.8 },
  //   // [Context.iris.$.parent]: { factor: 0.4 },
  //   // [Context.iris.$.next]: { factor: 0.9 },
  //   // [Context.iris.$.previous]: { factor: 0.1 },
  //   // [Context.iris.$.resource]: { factor: 0.4 },
  // },
  [Context.iris.$.Resource]: {
    factor: 1,
    [Context.iris.$.topic]: { factor: 1 },
    [Context.iris.$.tag]: {
      factor: 1,
      // [Context.iris.$.about]: { factor: 0.2 },
    },

    // [Context.iris.$.annotation]: {
    //   factor: 1,
    //   // [Context.iris.$.about]: { factor: 0.2 },
    // },
  },
  [Context.iris.$.Tag]: {
    factor: 1,
    [Context.iris.$.about]: { factor: 1 },
  },
  // [Context.iris.$.Annotation]: {
  //   factor: 1,
  //   [Context.iris.$.about]: { factor: 1 },
  // },
  // [Context.iris.$.Entity]: {
  //   factor: 1,
  //   // [Context.iris.$.resource]: { factor: 0.7 },
  // },
};

export const Attributes = {
  [Context.iris.$.Tag]: {
    [Context.iris.$.score]: true,
    [Context.iris.$.about]: true,
  },
  // [Context.iris.$.Annotation]: {
  //   [Context.iris.$.score]: true,
  // }
}

export const ToSkip = {
  // [Context.iris.$.Tag]: true
}

export type EdgeFactor = {
  factor: number
}

export interface EdgesToken {
  [index: string]: EdgeFactor | EdgesToken | (EdgeFactor & {
    [index: string]: EdgesToken
  })
};

export type Edges = EdgeFactor | (EdgeFactor & {
  [index: string]: EdgesToken
});

