;(function (doc, win) {
    const oTodoInput = doc.querySelector('.todo-list__input');
    const oTodoAddBtn = doc.querySelector('.todo-list__add-btn');
    const oTodoBody = doc.querySelector('ul');

    oTodoAddBtn.addEventListener('click', handleAddTodo);

    oTodoBody.addEventListener('click', async (event) => {
        const tagName = event.target.tagName.toLowerCase();
        const oLi = event.target.parentNode;
        const id = oLi.dataset.id;

        if (tagName === 'button') {
            handleDeleteTodo(id);
        } else if (tagName === 'input') {
            handleToggleTodo(id);
        }
    });

    /**
     * 新增事项
     */
    async function handleAddTodo () {
        const todoInput = oTodoInput.value;
        if (!todoInput) {
            alert('请先输入任务内容!');
            return;
        }

        const [err, res] = await usePromise(fetch('/todo/add', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id: createId(),
                completed: false,
                content: todoInput
            })
        }).then(res => res.json()));
        if (err) {
            alert(err);
            return;
        }

        alert(res.msg);
        reload();
    }

    /**
     * 删除事项
     * @param {string} id 事项id
     */
    async function handleDeleteTodo (id) {
        const [err, res] = await usePromise(fetch(`/todo/delete/${id}`, {
            method: 'delete'
        }).then(res => res.json()));
        if (err) {
            alert(err);
            return;
        }

        alert(res.msg);
        reload();
    }

    /**
     * 更新事项
     * @param {string} id 事项id
     */
    async function handleToggleTodo (id) {
        const [err, res] = await usePromise(fetch(`/todo/update/${id}`, {
            method: 'put'
        }).then(res => res.json()));
        if (err) {
            alert(err);
            return;
        }

        alert(res.msg);
        reload();
    }

    function usePromise (promise) {
        return promise.then(data => [undefined, data]).catch(e => [e]);
    }

    function createId () {
        return Date.now().toString();
    }

    /**
     * 重载页面
     */
    function reload () {
        win.location.reload();
    }
})(document, window);