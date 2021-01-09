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
                    <em>{props.name}</em>
                    <br />
                    <em>{props.affiliation}</em>
                </p>
            </div>
        </div>
    );
};
function getImageDiv(imageUrl: string | undefined) {
    return (
        <div className="attribution-image-container">
            {imageUrl && (
                <img
                    className="attribution-image"
                    src={imageUrl}
                    alt="speaker"
                />
            )}
        </div>
    );
}
