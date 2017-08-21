import React from 'react';
import WaveDetails from './WaveDetails.jsx';
import Request from 'superagent';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {Grid, Row, Col} from 'react-flexbox-grid/lib';
import {CSVLink, CSVDownload} from 'react-csv';
import FileDrop from './FileDrop.jsx';
import NVD3Chart from 'react-nvd3';
import Paper from 'material-ui/Paper';
import RemoveIcon from 'material-ui/svg-icons/content/remove-circle-outline';

const styles = {
  button: {
    float: 'right'
  },
  paperHidden: {
    display: 'none',
		padding: 20,
		borderRadius: 5,
		backgroundColor: '#C6D8D3'
	},
  paper: {
		padding: 20,
		borderRadius: 5,
		backgroundColor: '#C6D8D3'
	}
}

const file_types = ['ZCOP', 'ERD', 'Digi-Thon']
const graphCategories = ['Billability', 'Trainings Completed', 'Trainings In Progress']
const graphTypes = ['pieChart', 'discreteBarChart']
const billingTags = ['Billable', 'Non-Billable (Internal)', 'Non-Billable (Customer)', 'Support', 'Free']

export default class WiproAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: {
        SRC: {},
        REPORT: {}
      },
      file: '',
      csvData: [],
      disableMerge: true,
      expandedSector: '',
      value: null,
      billabilityGData: [],
      gType: '',
      gTitle: '',
      graphs: [],
      billingTags: [],
      billabilityStats: [],
      billabilityStatsWithoutCandidates: [],
      trainingStats: [],
      trainingStatsWithoutCandidates: []
    }

    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleMerge = this.handleMerge.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.addGraph = this.addGraph.bind(this);
    this.removeGraph = this.removeGraph.bind(this);
    this.isADuplicateGraph = this.isADuplicateGraph.bind(this);
    this.handleGPropChange = this.handleGPropChange.bind(this);
    this.getBillabilityStats = this.getBillabilityStats.bind(this);
    this.getTrainingStats = this.getTrainingStats.bind(this);
  }

  componentWillMount() {
    this.getBillabilityStats();
    this.getTrainingStats();
  }

  handleFileChange(event, key, val) {
    this.setState({file: val})
  }

  handleDrop(acc, rej, type) {
    let files = this.state.files;
    if (type == 'REPORT') {
      files[type] = acc[0];
    } else {
      files['SRC'] = acc[0];
    }
    this.setState({files: files})
  }

  handleMerge() {
    console.log('Sending a request')
    let th = this;
    Request.post('/upload/merge?file=' + th.state.file).set({'Authorization': localStorage.getItem('token')}).attach('src', this.state.files.SRC).attach('report', this.state.files.REPORT).end(function(err, res) {
      if (err)
        console.log(err);
      else {
        console.log('File data', res.body)
        th.setState({csvData: res.body})
      }
    })
  }

  getBillabilityStats() {
     let th = this;
     Request.get('/dashboard/billabilitystats')
     .set({'Authorization': localStorage.getItem('token')})
     .end(function(err, res) {
       if (err)
         console.log(err);
       else {
         let billabilityStats = JSON.parse(JSON.stringify(res.body));
         let billabilityStatsWithoutCandidates = JSON.parse(JSON.stringify(res.body));
         billabilityStatsWithoutCandidates.map(function(element) {
           if(element.label == 'Billable') {
             element.color = '#F9CB40'
           } else if(element.label == 'Non-Billable (Internal)') {
             element.color = '#FF715B'
           } else if(element.label == 'Non-Billable (Customer)') {
             element.color = '#06D6A0'
           } else if(element.label == 'Free') {
             element.color = '#BCED09'
           } else if(element.label == 'Support') {
             element.color = '#2F52E0'
           }
           element.value = element.value.length
         })
         console.log('Billing Stats: ', res.body)
         let newState = {
           billabilityStats: billabilityStats,
           billabilityStatsWithoutCandidates: billabilityStatsWithoutCandidates
         };
         th.setState(newState);
       }
     })
  }

  getTrainingStats() {
     let th = this;
     let colors = {Hybrid: '#F9CB40', Immersive: '#FF715B', Online: '#06D6A0'}
     Request.get('/dashboard/trainingstats')
     .set({'Authorization': localStorage.getItem('token')})
     .end(function(err, res) {
       if (err)
         console.log(err);
       else {
         let trainingStats = JSON.parse(JSON.stringify(res.body));
         let trainingStatsWithoutCandidates = JSON.parse(JSON.stringify(res.body));
         trainingStatsWithoutCandidates.completed.map(function(element) {
           element.color = colors[element.label];
           element.value = element.value.length;
         });
         trainingStatsWithoutCandidates.ongoing.map(function(element) {
           element.color = colors[element.label];
           element.value = element.value.length;
         });
         console.log('Training Stats: ', res.body)
         let newState = {
           trainingStats: trainingStats,
           trainingStatsWithoutCandidates: trainingStatsWithoutCandidates
         }
         th.setState(newState)
       }
     })
  }

  handleTagChange(e, k, v) {
    let th = this;
    let graphs = this.state.graphs;
    graphs.some(function(graph) {
      if(graph.title == 'Billability') {
        let newData = th.state.billabilityStatsWithoutCandidates.filter(function(datum) {
          return (v.indexOf(datum.label) != -1)
        })
        graph.data = newData;
      }
    })
    this.setState({billingTags: v, graphs: graphs})
  }

  addGraph() {
    let th = this;
    let graph = {};
    let graphs = th.state.graphs;
    console.log('gTitle: ', th.state.gTitle)
    if(th.state.gTitle == 'Billability') {
      graph.title = th.state.gTitle;
      graph.data = th.state.billabilityStatsWithoutCandidates;
        if(!th.isADuplicateGraph(th.state.gTitle)) graphs.push(graph);
        th.setState({
          graphs: graphs
        });
    } else if(th.state.gTitle == 'Trainings Completed') {
      graph.title = th.state.gTitle;
      graph.data = th.state.trainingStatsWithoutCandidates.completed;
        if(!th.isADuplicateGraph(th.state.gTitle)) graphs.push(graph);
        th.setState({
          graphs: graphs
        });
    } else if(th.state.gTitle == 'Trainings In Progress') {
      graph.title = th.state.gTitle;
      graph.data = th.state.trainingStatsWithoutCandidates.ongoing;
        if(!th.isADuplicateGraph(th.state.gTitle)) graphs.push(graph);
        th.setState({
          graphs: graphs
        });
    }
  }

  removeGraph(title) {
    let graphs = this.state.graphs;
    let filteredGraphs = graphs.filter(function (graph) {
      return graph.title != title
    });
    this.setState({
      graphs: filteredGraphs,
      billingTags: []
    });
  }

  isADuplicateGraph(title) {
    let graphs = this.state.graphs;
    return graphs.some(function(graph) {
      return graph.title == title
    });
  }

  handleGPropChange(prop, value) {
    let th = this;
    let newState = {};
    let propName = 'g' + prop[0].toUpperCase() + prop.slice(1);
    newState[propName] = value;
    this.setState(newState);
  }

  render() {
    let th = this;

    return (
      <div>
        <Paper  style={styles.paper}>
          <WaveDetails /><br/>
        </Paper>
        <Paper style={styles.paper}>
          <div>
          <SelectField value={this.state.file} onChange={this.handleFileChange} floatingLabelText="Select File">
            {
              file_types.map(function(file, key) {
                return <MenuItem key={key} value={file} primaryText={file}/>
              })
            }
          </SelectField>
          <RaisedButton label="Merge" primary={true} onClick={this.handleMerge}/>
          <br/>
          <CSVLink data={this.state.csvData} filename="da_db.xlsx" style={styles.button}>
            Download
          </CSVLink>
        </div>
        <div>
          <FileDrop type={this.state.file} handleDrop={this.handleDrop}/>
          <br/>
          <FileDrop type="REPORT" handleDrop={this.handleDrop}/>
        </div>
      </Paper>
      <Paper  style={styles.paper}>
        <div>
          {/*<div style={{display: 'inline-block', width: 250}}>
            <SelectField
              value={this.state.gType || 'pieChart'}
              onChange={(e, k, v)=>{th.handleGPropChange('type', v)}}
              floatingLabelText="Graph Type">
              {
                graphTypes.map(function(type, key) {
                  return <MenuItem key={key} value={type} primaryText={type.toUpperCase()}/>
                })
              }
            </SelectField>
          </div>*/}
          <div style={{display: 'inline-block', width: 250}}>
            <SelectField
              value={this.state.gTitle}
              onChange={(e, k, v)=>{th.handleGPropChange('title', v)}}
              floatingLabelText="Target Field">
              {
                graphCategories.map(function(title, key) {
                  return <MenuItem key={key} value={title} primaryText={title.toUpperCase()}/>
                })
              }
            </SelectField>
          </div>
          <div style={{display: 'inline-block', width: 250}}>
            <RaisedButton label="Add Graph" primary={true} onClick={th.addGraph} style={{width: '100%'}}/>
          </div>
        </div>
        <div>
        {
          th.state.graphs.map(function(graph) {
            return (
              <Paper style={{
                width: '770',
                height: '600',
                backgroundColor: '#fff',
                display: 'inline-block',
                margin: '5px',
                position: 'relative'
              }}>
                <h3 style={{height: '5%', textAlign: 'center', textTransform: 'uppercase'}}>
                  {graph.title}
                </h3>
                <div style={{width: '100%', height:'95%'}}>
                  {
                      graph.title == 'Billability' ?
                      <SelectField
                        value={th.state.billingTags}
                        onChange={th.handleTagChange}
                        multiple={true}
                        floatingLabelText="Select Billability">
                        {
                          billingTags.map(function(tag, key) {
                            return <MenuItem key={key} value={tag} primaryText={tag}/>
                          })
                        }
                      </SelectField> : ''
                  }
                  <NVD3Chart type="pieChart" tooltip={{enabled: true}}
                  datum={graph.data} x="label" y="value" height={500} width={500}/>
                </div>
                <RemoveIcon
                  style={{position: 'absolute', right: 10, top: 15, cursor: 'pointer'}}
                  onTouchTap={()=>{th.removeGraph(graph.title)}}
                />
              </Paper>
            )
          })
        }
        </div>
      </Paper>
      </div>
    )
  }
}
