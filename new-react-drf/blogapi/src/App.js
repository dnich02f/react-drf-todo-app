import './App.css';
import React, {Fragment, useEffect, useState} from 'react';
import {get} from "axios";

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

export default function App() {
    const [todoList, setTodoList] = useState(null)
    const [activeItem, setActiveItem] = useState({id: null, title: '', completed: false})
    const [editing, setEditing] = useState(false)

    useEffect(
        () => {
            fetchTasks();
        }, []
    );

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Function to fetch tasks from a data source.
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}task-list/`);
            const data = await response.json();
            setTodoList(data);
        } catch (error) {
            console.log(error);
        }
    };

    function handleChange(e) {
        let name = e.target.name
        let value = e.target.value
        setActiveItem({
            ...activeItem, // spread existing activeItem properties (create new object/array by
                           // copying properties/elements from another object/array)
            title: value
        })
    }

    function clearTitle() {
        setActiveItem({
            ...activeItem, title: ''
        });
    }

    async function handleSubmit(e) {
        e.preventDefault()

        let url = `${API_BASE_URL}/task-create/`
        if (editing === true) {
            url = `${API_BASE_URL}/task-update/${activeItem.id}/`
            setEditing(false);
        }

        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(activeItem),
            });
            clearTitle();
            await fetchTasks();
        } catch (error) {
            console.log(error);
        }
    }

    function startEdit(item) {
        setActiveItem(item);
        console.log("task: ", item)
        setEditing(true);
    }

    async function deleteItem(item) {
        let url = `${API_BASE_URL}/task-delete/${item.id}/`;
        try {
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            });
            await fetchTasks(); // Wait for fetchTasks to complete before proceeding
        } catch (error) {
            console.log(error);
        }
    }


    function strikeThrough(item) {
        item.completed = !item.completed;
        let url = `http://127.0.0.1:8000/api/task-update/${item.id}/`
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken' : getCookie('csrftoken'),
            },
            body: JSON.stringify(item)
        }).then(() => {
            fetchTasks();
        }).catch(error => {
            console.log(error);
        })
    }


    return (
        <Fragment>
            <div className="container">
                <div id="task-container">
                    <div id="form-wrapper">
                        <form onSubmit={handleSubmit} id="form">
                            <div className="flex-wrapper">
                                <div style={{flex: 6}}>
                                    <input onChange={handleChange} className="form-control" id="title"
                                           type="add" name="title" value={activeItem.title} placeholder="Add a Task">
                                    </input>
                                </div>
                                <br/>
                                <div style={{flex: 1}}>
                                    <input id="submit" className="btn" type="submit"
                                           name="Add" title="Submit">
                                    </input>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div id="list_wrapper" className="">
                        {
                            todoList &&
                            todoList.map(item => (
                                <div className="task-wrapper flex-wrapper" key={item.id}>
                                    <div onClick={() => strikeThrough(item)} style={{flex: 7}}>
                                        {item.completed === false ? item.title : <strike>{item.title}</strike>}
                                    </div>

                                    <div style={{flex: 1}}>
                                        <button onClick={() => startEdit(item)}
                                                className="btn btn-sm btn-outline-info">Edit
                                        </button>
                                    </div>

                                    <div style={{flex: 1}}>
                                        <button onClick={() => deleteItem(item)}
                                                className="btn btn-sm btn-outline-dark delete">-
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
