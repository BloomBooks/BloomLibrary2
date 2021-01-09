// display an attribution for a testimonial, with an optional picture and an optional
// affiliation for the one giving the testimonial.
import * as React from "react";

export interface IAttributionProps extends React.HTMLAttributes<HTMLElement> {
    image?: string; // optional url of photograph
    name: string; // name of the person giving the testimonial such as "Jane Smith"
    affiliation?: string; // optional value like "University of Somewhere"
}

export const Attribution: React.FunctionComponent<IAttributionProps> = (
    props
) => {
    return (
        <div className="attribution-row">
            {getImageDiv(props.image)}
            <div className="attribution-text">
                <p>
                    {props.name}
                    <br />
                    {props.affiliation}
                </p>
            </div>
        </div>
    );
};
function getImageDiv(image: string | undefined) {
    if (image) {
        return (
            <div className="attribution-image">
                <img src={image} height="100%" alt="speaker" />
            </div>
        );
    } else {
        return <div className="attribution-image" />;
    }
}
