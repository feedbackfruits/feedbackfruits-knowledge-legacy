import SemanticGraph = require('semantic-graphql');
import { Context } from 'feedbackfruits-knowledge-engine';
import * as resolvers from './resolvers';

export const graph = new SemanticGraph(resolvers, { relay: false });
graph.parse(Context.turtle);

graph['https://knowledge.express/tag'].shouldNeverUseInverseOf = true;
graph['https://knowledge.express/annotation'].shouldNeverUseInverseOf = true;
// graph['https://knowledge.express/caption'].shouldNeverUseInverseOf = true;

export default graph;
