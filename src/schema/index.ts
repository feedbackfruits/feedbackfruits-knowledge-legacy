import {
  graphql,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  FieldNode
} from 'graphql';

import { FieldOfStudyType } from './field_of_study';
import { TopicType } from './topic';
import EntityType from './entity';
import { ResourceInterfaceType } from './resource';
import { VideoResourceType } from './resource/video';

import { build, BuilderObjectType } from '../builder';
import { GraphQLBuilder } from '../builder/graphql';
import { SparQLBuilder } from '../builder/sparql';

import * as Context from '../builder/context';

import cayley from '../cayley';
import dbpedia from '../dbpedia';

export const Schema = new GraphQLSchema({
  query: new BuilderObjectType<GraphQLBuilder | SparQLBuilder>({
    name: 'RootQueryType',
    fields: {
      fieldOfStudy: {
        type: FieldOfStudyType,
        args: {
          id: {
            type: GraphQLString,
          },
          name: {
            type: GraphQLString
          }
        },

        build(builder: GraphQLBuilder, { id, name }, path) {
          if (id != null && name == null) return builder.filter({ id: `<${id}>` });

          let fieldOfStudy = new GraphQLBuilder(`${Context.name} @rev`);

          builder.filter({ id: name });
          builder.find({ fieldOfStudy });

          return fieldOfStudy;
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'fieldOfStudy');
          let query = `{ ${builder.toString()} }`;
          return cayley(query).then((res: any) => res.nodes);
        }
      },
      topic: {
        type: TopicType,
        args: {
          id: {
            type: GraphQLString,
          }
        },

        build(builder: GraphQLBuilder, { id, name }, path) {
          return builder.filter({ id: `<${id}>` });

          // let topic = new GraphQLBuilder(`${Context.Knowledge.Topic} @rev`);
          //
          // builder.find({ topic });

          // return builder;
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'topic');
          let query = `{ ${builder.toString()} }`;
          // debugger;
          return cayley(query).then((res: any) => res.nodes);
        }
      },
      entity: {
        type: EntityType,
        args: {
          id: {
            type: GraphQLString,
          }
        },

        build(builder: GraphQLBuilder, { id, name }, path) {
          return builder.filter({ id: `<${id}>` });
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'entity');
          let query = `{ ${builder.toString()} }`;
          return cayley(query).then((res: any) => res.nodes);
        }
      },
      resource: {
        type: ResourceInterfaceType,
        args: {
          id: {
            type: GraphQLString,
          }
        },

        build(builder: GraphQLBuilder, { id, name }, path) {
          return builder.filter({ id: `<${id}>` });
        },
        resolve(source, { }, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'resource');
          let query = `{ ${builder.toString()} }`;
          return cayley(query).then((res: any) => res.nodes);
        }
      },
      resources: {
        type: new GraphQLList(ResourceInterfaceType),
        args: {
        },
        build(builder: GraphQLBuilder, { }, path) {
          builder.filter({ id: Context.Knowledge.Resource });

          let resources = new GraphQLBuilder(`${Context.type}`);

          resources.directive({ name: 'rev', args: [] });
          resources.filter({ first: 10 });

          builder.find({ resources });

          return resources;
        },
        resolve(source, args, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'resources');
          let query = `{ ${builder.toString()} }`;
          return cayley(query).then((res: any) => res.nodes.resources);
        }
      },
      videos: {
        type: new GraphQLList(VideoResourceType),
        args: {
        },
        build(builder: GraphQLBuilder, { }, path) {
          builder.filter({ id: Context.Knowledge.Resource });

          let videos = new GraphQLBuilder(`${Context.type}`);

          videos.directive({ name: 'rev', args: [] });
          videos.filter({ first: 10 });

          builder.find({ videos });

          return videos;
        },
        resolve(source, args, context, info) {
          let { operation: node, parentType: type } = info;
          let base = new GraphQLBuilder('nodes',);
          let builder = build(node, <BuilderObjectType<GraphQLBuilder>>type, base, 'videos');
          let query = `{ ${builder.toString()} }`;
          return cayley(query).then((res: any) => res.nodes.videos);
        }
      }
    }
  })
});

export default Schema;
