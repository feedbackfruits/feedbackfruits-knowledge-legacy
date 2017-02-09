"use strict";
require('dotenv').load({ silent: true });
var _a = process.env.CAYLEY_ADDRESS, CAYLEY_ADDRESS = _a === void 0 ? 'http://cayley:64210' : _a;
var node_fetch_1 = require("node-fetch");
var cayley = require("node-cayley");
var graphql_1 = require("graphql");
var client = cayley(CAYLEY_ADDRESS, {
    promisify: true
});
var graph = client.g;
Promise.resolve(graph
    .V("<http://dbpedia.org/resource/Anthropology>")
    .Out("<http://schema.org/sameAs>")
    .Out("<http://academic.microsoft.com/parentFieldOfStudy>")
    .In("<http://schema.org/sameAs>")
    .All()).then(function (res) {
    debugger;
    console.log(res);
}).catch(function (err) {
});
console.log('hi');
var MAG_API_ENDPOINT = 'https://academic.microsoft.com/api/browse/GetEntityDetails';
var DBPEDIA_ENDPOINT = 'http://dbpedia.org/resource/';
function get(id) {
    var url = MAG_API_ENDPOINT + "?entityId=" + id + "&correlationId=1";
    return node_fetch_1.default(url).then(function (response) { return response.json(); });
}
;
var FieldType = new graphql_1.GraphQLObjectType({
    name: 'FieldType',
    fields: function () { return ({
        parents: {
            type: FieldType,
            resolve: function (source, args, context, info) {
                var id = args.id;
                return { source: source, args: args, context: context, info: info };
            }
        },
        children: {
            type: FieldType,
            resolve: function (source, args, context, info) {
                return { source: source, args: args, context: context, info: info };
            }
        }
    }); }
});
var schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            get: {
                type: graphql_1.GraphQLString,
                args: {
                    id: {
                        type: graphql_1.GraphQLString,
                    }
                },
                resolve: function (source, _a, context, info) {
                    var id = _a.id;
                    return id;
                }
            }
        }
    })
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
