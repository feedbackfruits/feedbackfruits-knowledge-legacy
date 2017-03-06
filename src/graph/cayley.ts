import fetch from 'node-fetch';

import {
  CAYLEY_ADDRESS
} from '../config';


let queryText = `g.V("linguistics")
	.In("<http://schema.org/name>")

	.Has("<http://schema.org/name>")
	.Has("<http://schema.org/description>")
	.Has("<http://schema.org/image>")
	.Tag("topic_id")

	.Save("<http://schema.org/name>", "topic_name")
  .Save("<http://schema.org/description>", "topic_description")
  .Save("<http://schema.org/image>", "topic_image")

	.Out("<http://academic.microsoft.com/parentFieldOfStudy>")
	.Tag("parent_topic_id")
  .Save("<http://schema.org/name>", "parent_topic_name")
  .Save("<http://schema.org/image>", "parent_topic_image")

	.All()`;

export function query(query) {
  let url = `${CAYLEY_ADDRESS}api/v1/query/gremlin`;
  return fetch(url, {
    method: 'post',
    body: query,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }).then(response => response.json());
}

query(queryText).then(console.log)
