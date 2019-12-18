import './index.css';
import Chart from 'chart.js';
import React from 'react';
import ReactDOM from 'react-dom';

document.body.innerHTML = '<div class="react-container"></div>';

class Main extends React.Component {

    constructor() {
        super();
        this.state = {
            currentCompany: 'Акрон',
            startDate: '2019-11-01',
            endDate: '2019-11-30',
            allCompanies: [],
            labels: [],
            data: [],
            gettingDataBoolean: false
        }
    }

    getAllStocks() {

        this.setState({ gettingDataBoolean: true });

        let Promises = [];
        this.state.labels = [];
        this.state.data = [];
        this.state.Chart = false;
        const startDate = new Date(this.state.startDate);
        const endDate = new Date(this.state.endDate);

        while (startDate.getTime() <= endDate.getTime()) {
            const year = startDate.getFullYear().toString();
            const month = (startDate.getMonth() + 1).toString();
            const day = startDate.getDate().toString();

            Promises.push(
                fetch('http://iss.moex.com/iss/history/engines/stock/markets/shares/boards/tqbr/securities.json?date=' + year + '-' + month + '-' + day)
                    .then(response => response.json())
                    .then(response => {
                        if (response.history.data.length !== 0) {
                            const closePriceIndex = response.history.columns.indexOf("CLOSE");
                            const tradeDateIndex = response.history.columns.indexOf("TRADEDATE");
                            const nameIndex = response.history.columns.indexOf("SHORTNAME");
        
                            response.history.data.forEach(element => {
                                const date = element[tradeDateIndex];
                                if(!this.state.data[date]) {
                                    this.state.data[date] = {};
                                };
                                const comp = element[nameIndex];
                                this.state.data[date][comp] = element[closePriceIndex];
                                if(!this.state.allCompanies.find(item => item == comp)) {
                                    this.state.allCompanies.push(comp);
                                }
                            })
                        }
                    })
            );
            startDate.setDate(startDate.getDate() + 1);
        };
        
        return Promise.all(Promises)
            .then(() => {
                for (let key in this.state.data) {
                    this.state.labels.push(key);
                };       
            })
            .then(() => {
                this.state.labels.sort((a,b) => {
                    return +a.substr(0, 4) - +b.substr(0, 4) || +a.substr(5, 2) - +b.substr(5, 2) || +a.substr(-2) - +b.substr(-2)
                });
                this.setState({ gettingDataBoolean: false });
            })
            .then(() => this.updateChart());
    }

    componentDidMount() {
        this.getAllStocks()
            .then(() => this.setState({ currentCompany: this.state.allCompanies[0] }));
    }

    componentDidUpdate(prevProps, prevState) {
        if( prevState.startDate == this.state.startDate && prevState.endDate == this.state.endDate ) {
            if( prevState.currentCompany !== this.state.currentCompany ){
                this.updateChart();
            };
        } else if( this.state.startDate.length == 10 && this.state.endDate.length == 10 ) {
            this.getAllStocks()
                .then(() => {
                    this.setState({ currentCompany: this.state.currentCompany });
                });
        }
    }

    updateChart() {
        const prices = [];
        for (let date in this.state.data) {
            prices.push(this.state.data[date][this.state.currentCompany])
        }
        if(this.state.Chart) {
            let chart = this.state.Chart;

            chart.data.labels = this.state.labels;
            chart.data.datasets[0].label = this.state.currentCompany;
            chart.data.datasets[0].data = prices;

            chart.update();

            console.log('Updated');
        } else {
            const ctx = document.getElementById('myChart');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.state.labels,
                    datasets: [{
                        label: this.state.currentCompany,
                        data: prices,
                        borderWidth: 1,
                        backgroundColor: 'rgba(0, 17, 255, 0.192)'
                    }]
                },
            });
            this.setState({ Chart: myChart })
            console.log('Created');
        }
    }

    checkAndUpdateDate(ev, dateType) {
        const len = ev.target.value.length;

        if(len > 10) {
            ev.preventDefault();
        } else {
            if (dateType == 'from') {
                this.setState({ startDate: ev.target.value});
            } else {
                this.setState({ endDate: ev.target.value });
            }
        }
    }

    render() {

        if (this.state.gettingDataBoolean) {
            return (
                <div>
                    <header>
                    <h1>Stock Dynamics Overview</h1>
                    <label className="date date--from">
                        From
                        <input type='text' placeholder='YYYY-MM-DD' value={ this.state.startDate } onChange={ ev => this.checkAndUpdateDate(ev, 'from') }></input>
                    </label>
                    <label className="date">
                        To
                        <input type='text' placeholder='YYYY-MM-DD' value={ this.state.endDate } onChange={ ev => this.checkAndUpdateDate(ev, 'to') }></input>
                    </label>
                    <select value = { this.state.currentCompany } onChange={ ev => this.setState({ currentCompany: ev.target.value }) }>
                        {
                            this.state.allCompanies.map((item, i) => {
                                return <option key={ i }>{ item }</option>
                            })
                        }
                    </select>
                    </header>
                    <div className="wait">
                        Loading
                    </div>
                </div>
            )
        } else {
            return(
                <div>
                    <header>
                        <h1>Stock Dynamics Overview</h1>
                        <label className="date date--from">
                            From
                            <input type='text' placeholder='YYYY-MM-DD' value={ this.state.startDate } onChange={ ev => this.checkAndUpdateDate(ev, 'from') }></input>
                        </label>
                        <label className="date">
                            To
                            <input type='text' placeholder='YYYY-MM-DD' value={ this.state.endDate } onChange={ ev => this.checkAndUpdateDate(ev, 'to') }></input>
                        </label>
                        <select value = { this.state.currentCompany } onChange={ ev => this.setState({ currentCompany: ev.target.value }) }>
                            {
                                this.state.allCompanies.map((item, i) => {
                                    return <option key={ i }>{ item }</option>
                                })
                            }
                        </select>
                    </header>
                    <main>
                        <canvas id='myChart'></canvas>
                    </main>
                </div>
            )
        }
    }
}

ReactDOM.render(
    <Main/>,
    document.querySelector('.react-container')
);