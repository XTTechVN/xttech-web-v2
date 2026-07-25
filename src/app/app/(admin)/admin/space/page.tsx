actions
- getSpaces
- createSpace
- updateSpace
- deleteSpace

page



components
- spacetable | fetcher (getSpace, api.get('/api/v1/spaces')) -> table | updateSpace, deleteSpace | -> /space/{id}/edit
- spacetoolbar | createSpace -> modal | new page '/space/new'
