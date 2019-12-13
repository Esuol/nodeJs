const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Book {
    title: String
    author: Author
  }

  type Author {
    name: String
    books: [Book]
  }

  type Query {
    getBooks: [Book]
    getAuthors: [Author]
  }
`;

const books = [
  {
    title: '书1',
    author: {
      name: '作者1',
      books: [
        {
          title: '书1',
          author: '作者1',
        }
      ]
    },
  },
  {
    title: '书2',
    author: {
      name: '作者2',
      books: [
        {
          title: '书2',
          author: '作者2',
        }
      ]
    },
  },
];

const authors = [
  {
    name: '作者1',
    books: [
      {
        title: '书1',
        author: '作者1',
      }
    ]
  },
  {
    name: '作者2',
    books: [
      {
        title: '书2',
        author: '作者2',
      }
    ]
  }
]


const resolvers = {
  Query: {
    getBooks: () => books,
    getAuthors: () => authors
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});