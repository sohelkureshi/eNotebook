import React from 'react'

function Alert(props) {
    return (
        <div style={{ height: '60px' }}>
            {props.alertMsg &&
                <div className={`alert alert-${props.alertMsg.type.toLowerCase()} alert-dismissible fade show`} role="alert">
                    <strong>{props.alertMsg.type === 'Danger' ? 'Error' : props.alertMsg.type}! </strong>{props.alertMsg.msg}
                    {/* <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> */}
                </div>
            }
        </div>
    )
}

export default Alert