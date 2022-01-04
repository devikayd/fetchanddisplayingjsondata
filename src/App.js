import './App.css';
import React, {Component} from 'react';

class StudentCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
            tagText: ''
        }
    }

    handleOnChange = (event) => {
        const {target: {value}} = event;

        this.setState((prevState) => {
            return {
                ...prevState,
                tagText: value
            }
        })
    }

    handleKeyDown = (event) => {
        const {target: {value}} = event;
        if (event.key === 'Enter') {
            this.props.onTag(value, this.props.item);
            this.setState({tagText: ''})
        }
    }

    render() {
        const {isActive, tagText} = this.state;
        const {item} = this.props;
        const total = item.grades.map(grade => Number(grade)).reduce((sum, grade) => (sum + grade));
        //average rounded to 2 fractions
        const avg = (total / item.grades.length).toFixed(2);


        return <div className="StudentCard">
            <div className="StudentImg">
                <img src={this.props.item.pic} alt={`${this.props.item.firstName} ${this.props.item.lastName}`}/>
            </div>
            <div className="StudentInfoWrapper">
                <div className="StudentTitle">
                    <div>
                        <h2>{this.props.item.firstName} {this.props.item.lastName}</h2>
                    </div>
                    <div>
                        <button onClick={() => {
                            this.setState({isActive: !isActive})
                        }}>
                            <h2>{isActive ? "-" : "+"}</h2>
                        </button>
                    </div>
                </div>
                <div className="StudentInfo">
                    <p>Email : {this.props.item.email}</p>
                    <p>Company : {this.props.item.company}</p>
                    <p>Skill : {this.props.item.skill}</p>
                    <p>Average: {avg}%</p>
                    {isActive &&
                    <div className="StudentExpansionList">
                        {
                            item.grades.map((grade, index) => {
                                return <p key={index}>Test {index + 1}:<span/> {grade}%</p>
                            })
                        }
                    </div>
                    }
                    {/* tags goes here*/}
                    {item.tags && item.tags.length > 0 &&
                    <div className="StudentTags">
                        {item.tags.map(tag => <p>{tag}</p>)}
                    </div>
                    }
                    <div>
                        <input placeholder="Add a tag" value={tagText}
                               onChange={this.handleOnChange}
                               onKeyDown={this.handleKeyDown}
                        />
                    </div>
                </div>
            </div>
        </div>;
    }


}

class App extends Component {


    constructor(props) {
        super(props);

        this.state = {
            items: [],
            isLoaded: false,
            searchResults: [],
            searchText: '',
            searchTag: '',
        }
    }


    componentDidMount() {

        fetch('https://api.hatchways.io/assessment/students')
            .then(res => res.json())
            .then(json => {
                this.setState({
                    isLoaded: true,
                    items: json.students,
                })
            });

    }


    handleChange = (event) => {
        const {items} = this.state;
        const word = event.target.value.toLowerCase();
        const result = items.filter(item => {
            return item.firstName.toLowerCase().indexOf(word) > -1 || item.lastName.toLowerCase().indexOf(word) > -1;
        })

        this.setState((prevState) => {
            return {
                ...prevState,
                searchResults: result,
                searchText: word
            }
        })
    }
    handleOnChangeTag = (event) => {
        const {target: {value}} = event;

        this.setState((prevState) => {
            return {
                ...prevState,
                searchTag: value
            }
        })
    }

    addTags = (tag, student) => {

        const {items} = this.state;

        const newItems = items.map(item => {
            if (item.id === student.id) {
                // initialise tags
                const tags = item.tags ? item.tags : [];
                tags.push(tag);
                return {...item, tags: tags}
            }

            return item;
        })

        this.setState((prevState) => {
            return {
                ...prevState,
                items: newItems
            }
        })

    }


    render() {

        const {isLoaded, items, searchResults, searchText, searchTag} = this.state;

        let students = searchResults.length > 0 ? searchResults : items;
        const isResultByNameEmpty = searchResults.length === 0 && searchText;

        if (searchTag)
            students = students.filter(student => {
                if (!student.tags)
                    return false;
                return student.tags.findIndex((tag) => tag.toLowerCase().indexOf(searchTag.toLowerCase()) > -1) > -1;
            })


        if (!isLoaded) {
            return <div>Loading</div>
        } else {

            return (
                <div className="App">

                    <div className="StudentCardContainer">
                        <input type="text" placeholder="Search by name"
                               onChange={this.handleChange}/>
                        <input type="text" placeholder="Search by tag"
                               onChange={this.handleOnChangeTag}/>
                        <div className="ScrollingContainer">
                            {students.length > 0 && !isResultByNameEmpty ? students.map(item => (
                                <StudentCard key={item.id} item={item} onTag={this.addTags}/>
                            )) : <p className="NoResults"> No results
                                for {searchText && searchTag ? <>
                                    <span>{searchText} </span>and <span>{searchTag}</span>
                                </> : searchTag ?
                                    <span>{searchTag} </span> : <span>{searchText}</span>} </p>}
                        </div>
                    </div>


                </div>
            );
        }
    }


}

export default App;
