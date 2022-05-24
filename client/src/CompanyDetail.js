import React, { Component } from 'react';
import {loadCompany} from "./request";
import {JobList} from "./JobList";

export class CompanyDetail extends Component {
  state = {
    company: null
  }

  async componentDidMount() {
    const {match: {params: {companyId}}} = this.props
    const company = await loadCompany(companyId);
    this.setState({company});
  }

  render() {
    const {company} = this.state;

    if (!company)
      return <div>Loading...</div>

    return (
      <div>
        <h1 className="title">{company.name}</h1>
        <div className="box">{company.description}</div>
        <h5 className="title is-5">Jobs at {company.name}</h5>
        <JobList jobs={company.jobs}/>
      </div>
    );
  }
}
