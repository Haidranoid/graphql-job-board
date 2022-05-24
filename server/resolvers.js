const db = require('./db');

const Query = {
    job: (root, args) => db.jobs.get(args.id),
    company: (root, args) => db.companies.get(args.id),
    jobs: () => db.jobs.list(),
}

const Mutation = {
    createJob: (root, args, context) => {
        const {input} = args;
        const {user} = context;

        if (!user)
            throw new Error('Unauthorized')

        const id = db.jobs.create({
            title: input.title,
            description: input.description,
            companyId: user.companyId
        });

        return db.jobs.get(id);
    }
}

const Job = {
    company: job => db.companies.get(job.companyId)
}

const Company = {
    jobs: company => db.jobs.list()
        .filter(job => job.companyId === company.id)
}

module.exports = {
    Query,
    Mutation,
    Job,
    Company
};