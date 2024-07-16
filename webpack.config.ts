const path = require('path');

module.exports = {
    // Otras configuraciones...
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
};
