const styles = (theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: 10,
        width: '50%',
        marginLeft: '20%',
        height: 700,
        padding: 50
    },
    body: {
        alignSelf: 'start',
        padding: 50,
        width: '100%'
    },
    title: {
        width: '100%',
        textAlign: 'center',
        height: 50
    },
    actions: {
        alignSelf: 'end',
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row-reverse'
    },
    tokenList: {
        height: 200,
        width: 271,
        maxHeight: 200,
        overflow: 'auto',
    },
    formControl: {
        minWidth: 120,
    },
    select: {
        width: 223,
    },
    /* nextButton: {
        bottom: -100,
        right: -670
    },
    prevButton: {
        bottom: -100,
    },
    submitButton: {
        bottom: -100,
        right: -520
    } */
});

export default styles;