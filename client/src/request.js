import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "apollo-boost";
import {gql} from "apollo-boost";
import {getAccessToken, isLoggedIn} from "./auth";

const endpointURL = 'http://localhost:9000/graphql'

const authLink = new ApolloLink((operation, forward) => {

    if (isLoggedIn()) {
        //request.headers['Authorization'] = `Bearer ${getAccessToken()}`
        operation.setContext({
            headers: {'Authorization': `Bearer ${getAccessToken()}`},
        })
    }

    return forward(operation)
});

const client = new ApolloClient({
    link: ApolloLink.from([
        authLink,
        new HttpLink({uri: endpointURL}),
    ]),
    cache: new InMemoryCache(),
});

/*const graphqlRequest = async (query, variables = {}) => {
    const request = {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({query, variables})
    }

    if (isLoggedIn()) {
        request.headers['Authorization'] = `Bearer ${getAccessToken()}`
    }

    const response = await fetch(endpointURL, request);

    const responseBody = await response.json();
    if (responseBody.errors) {
        const message = responseBody.errors.map(error => error.message).join('\n');
        console.log(message)
        throw new Error(message)
    }

    return responseBody.data;
}*/

const jobDetailFragment = gql`
    fragment JobDetail on Job {
        id
        title
        description
        company {
            id
            name
            description
        }
    }
`

const jobQuery = gql`
    query JobQuery($jobId: ID!) {
        job(id: $jobId) {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`

const jobsQuery = gql`
    query JobsQuery{
        jobs {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`

const createJobMutation = gql`
    mutation CreateJobMutation($input: CreateJobInput) {
        job: createJob(input: $input){
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`


const companyQuery = gql`
    query CompanyQuery($companyId: ID!) {
        company(id: $companyId) {
            id
            name
            description
            jobs {
                id
                title
            }
        }
    }
`

export const loadJobs = async () => {
    const {data: {jobs}} = await client.query({
        query: jobsQuery,
        fetchPolicy: 'no-cache'
    });

    return jobs;
}

export const loadJob = async id => {
    const {data: {job}} = await client.query({
        query: jobQuery,
        variables: {
            jobId: id
        }
    });

    return job;
}

export const loadCompany = async id => {
    const {data: {company}} = await client.query({
        query: companyQuery,
        variables: {
            companyId: id
        }
    });

    return company;
}

export const createJob = async (title, description) => {
    const {data: {job}} = await client.mutate({
        mutation: createJobMutation,
        variables: {
            input: {
                title,
                description,
            }
        },
        update: (cache, mutationResult) => {
            const {data} = mutationResult;

            cache.writeQuery({
                query: jobQuery,
                variables: {
                    jobId: data.job.id
                },
                data
            })
        }
    });

    return job;
}