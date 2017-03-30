import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  FieldNode
} from 'graphql';

import * as Context from '../builder/context';

import { build, BuilderObjectType, FieldType } from '../builder';
import { GraphQLBuilder, buildRootType, resolveRootType } from '../builder/graphql';

import { FieldOfStudyType } from './field_of_study';
import { TopicType } from './topic';
import { EntityType }  from './entity';
import { ResourceInterfaceType } from './resource';
import { VideoResourceType } from './resource/video';

import cayley from '../cayley';

export const Schema = new GraphQLSchema({
  types: [
    FieldOfStudyType,
    TopicType,
    EntityType,
    VideoResourceType
  ],
  query: new BuilderObjectType<GraphQLBuilder>({
    name: 'RootQuery',
    fields: {
      fieldOfStudy: {
        type: FieldOfStudyType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString,
          }
        },
        build: buildRootType('fieldOfStudy', Context.AcademicGraph.FieldOfStudy),
        resolve: resolveRootType('fieldOfStudy')
      },
      topic: {
        type: TopicType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString,
          }
        },
        build: buildRootType('topic', Context.Knowledge.Topic),
        resolve: resolveRootType('topic')
      },
      entity: {
        type: EntityType,
        args: {
          id: {
            type: GraphQLString,
          }
        },
        build: buildRootType('entity', Context.Knowledge.Entity),
        resolve: resolveRootType('entity')
      },
      resource: {
        type: FieldOfStudyType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString,
          }
        },
        build: buildRootType('resource', Context.Knowledge.Resource),
        resolve: resolveRootType('resource')
      },

      fieldsOfStudy: {
        type: new GraphQLList(FieldOfStudyType),
        args: {
          id: {
            type: new GraphQLList(GraphQLString),
          },
          name: {
            type: new GraphQLList(GraphQLString),
          },
          first: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          }
        },
        build: buildRootType('fieldsOfStudy', Context.AcademicGraph.FieldOfStudy),
        resolve: resolveRootType('fieldsOfStudy', true)
      },
      topics: {
        type: new GraphQLList(TopicType),
        args: {
          id: {
            type: new GraphQLList(GraphQLString),
          },
          name: {
            type: new GraphQLList(GraphQLString),
          },
          first: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          }
        },
        build: buildRootType('topics', Context.Knowledge.Topic),
        resolve: resolveRootType('topics', true)
      },
      entities: {
        type: new GraphQLList(EntityType),
        args: {
          id: {
            type: new GraphQLList(GraphQLString),
          },
          name: {
            type: new GraphQLList(GraphQLString),
          },
          first: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          }
        },
        build: buildRootType('entities', Context.Knowledge.Entity),
        resolve: resolveRootType('entities', true)
      },
      resources: {
        type: new GraphQLList(ResourceInterfaceType),
        args: {
          id: {
            type: new GraphQLList(GraphQLString),
          },
          name: {
            type: new GraphQLList(GraphQLString),
          },
          first: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          }
        },
        build: buildRootType('resources', Context.Knowledge.Resource),
        resolve: resolveRootType('resources', true)
      }
    }
  })
});

export default Schema;
