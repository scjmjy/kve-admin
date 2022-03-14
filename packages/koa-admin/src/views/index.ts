export function getIndexHtml(title: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            padding-top: 50px;
        }
    </style>
</head>
<body>
    <ul>
        <li><a href="/">首页(字符串)</a></li>
        <li><a href="/index-html">首页(HTML)</a></li>
        <li><a href="/api/demo/get">GET</a></li>
        <li>
            <form method="POST" action="/api/demo/post">
                <button type="submit">POST</button>
                <input type="hidden" name="field1" value="value1"></input>
                <input type="hidden" name="field2" value="value2"></input>
            </form>
        </li>
    </ul>
</body>
</html>
`;
}
