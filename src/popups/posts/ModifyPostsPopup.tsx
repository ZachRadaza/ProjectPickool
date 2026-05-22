import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { type Post_Images, type Posts, type UserHeader } from "../../utils/schemas";
import CloseButton from "../../components/ui/buttons/CloseButton";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import Button from "../../components/ui/buttons/Button";
import DeleteButton from "../../components/ui/buttons/DeleteButton";
import "./ModifyPostsPopup.css";

type ModifyPostsPopupProp = {
    userHeader: UserHeader | null;
    club_id: string | null;
    setIsClosed: Dispatch<SetStateAction<boolean>>;
    post_id: string | null;
};


export default function ModifyPostsPopup({ userHeader, club_id, post_id, setIsClosed }: ModifyPostsPopupProp){
    const [postTemp, setPostTemp] = useState<Posts | null>(null);
    const [post, setPost] = useState<Posts | null>(null);
    const [validTitle, setValidTitle] = useState<boolean>(true);
    const [validDesc, setValidDesc] = useState<boolean>(true);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const isEditing = useMemo(() => !!post_id, []);

    function onDeleteImageClick(imageDelete: Post_Images){
        const filteredImages = postTemp?.images?.filter((image) => 
            (image.image !== imageDelete.image || image.temp_id !== imageDelete.temp_id)
        );
        setPostTemp((post) => post ? { ...post, images: filteredImages } : post);
    }

    function postChecks(){
        if(!userHeader?.id){
            setError("Cannot post with not user account");
            return false;
        }

        if(!postTemp){
            setError("Error has occured");
            return false;
        }

        if(!postTemp.title || !postTemp.description){
            setValidTitle(!!postTemp.title);
            setValidDesc(!!postTemp.description);
            return false;
        }

        return true;
    }

    async function btnPressed(isNewUpload: boolean){
        try{
            if(!postChecks() || !userHeader || !postTemp)
                return;

            setBtnLoading(true);

            isNewUpload ? await uploadPost(userHeader, postTemp) : await updatePost(userHeader, postTemp);

            setBtnLoading(false);
            setIsClosed(true);
            window.location.reload();
        } catch(error){
            setError("Error in uploading post");
        }
    }

    async function uploadPost(user: UserHeader, toPost: Posts){
        const posted = await ExtensionService.PostService.addPost(user.id, toPost);

        if(!posted){
            setError("Error in uploading post");
            setBtnLoading(false);
            return;
        }
    }

    async function updatePost(user: UserHeader, toPost: Posts){
        if(!toPost.id){
            setError("No Post id found");
            return;
        }

        const updates: Partial<Posts> = {};

        if(toPost?.title !== post?.title)
            updates.title = toPost?.title;
        if(toPost?.description !== post?.description)
            updates.description = toPost?.description;

        const updatedPost = await ExtensionService.PostService.updatePost(toPost.id, user.id, updates);

        if(!updatedPost){
            setError("Error in uploading post");
            setBtnLoading(false);
            return;
        }
    }

    useState(() => {
        getPost();

        async function getPost(){
            try{
                if(!userHeader){
                    setIsLoading(false);
                    setError("No User or Club");
                    return;
                }

                let postData: Posts | null;
                if(post_id)
                    postData = await ExtensionService.PostService.getPost(post_id, userHeader.id);
                else
                    postData = {
                        club_id: club_id ?? "",
                        user_id: userHeader.id,
                        title: "",
                        description: "",
                        images: []
                    };

                if(!postData){
                    setIsLoading(false);
                    setError("Error in fetching post");
                    return;
                }

                setPost(postData);
                setPostTemp(postData);
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("An Error has Occured")
            }
        }
    });

    let content;

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>;
    else
        content = 
            <>
                <h4>{ isEditing ? "Edit Post" : "Create Post" }</h4>
                <input 
                    className={ `title post-text-input inner-width ${!validTitle && "invalid"}` }
                    value={ postTemp?.title }
                    onChange={ (event) => setPostTemp((post) => post ? { ...post, title: event.target.value } : post) }
                    type="text"
                    placeholder="Post Title"
                    maxLength={ 50 }
                />
                <textarea
                    className={ `desc post-text-input inner-width ${!validDesc && 'invalid'}` }
                    value={ postTemp?.description }
                    onChange={ (event) => setPostTemp((post) => post ? { ...post, description: event.target.value } : post) }
                    placeholder="Write somthing here..."
                    rows={ 4 }
                    maxLength={ 500 }
                ></textarea>
                <div className="images-cont inner-width">
                    <div className="images">
                        { postTemp?.images && 
                            postTemp.images.map((image) => 
                                <div className="post-image" key={`${image.temp_id ? image.temp_id : image.image}`}>
                                    { !post_id && 
                                        <DeleteButton 
                                            onBtnClick={() => onDeleteImageClick(image) } 
                                            additionalClasses="post-image-delete"
                                        />
                                    }
                                    <img src={ image.image_file ? URL.createObjectURL(image.image_file) : image.image }/>
                                </div>
                        )}
                        { ((!postTemp?.images || postTemp?.images?.length < 10) && !isEditing) &&
                            <label className="upload-images-btn">
                                <h5>Add photos</h5>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    className="image-input"
                                    onChange={ (event) => {
                                        const files = Array.from(event.target.files ?? []);
                                        const images: Post_Images[] = files.map((file) => ({
                                            image_file: file,
                                            temp_id: crypto.randomUUID()
                                        }));

                                        setPostTemp((post) => post
                                            ? {
                                                ...post,
                                                images: [
                                                    ...(post.images ?? []),
                                                    ...images,
                                                ],
                                            }
                                            : post
                                        );
                                    }}
                                />
                            </label>
                        }
                    </div>
                    <div className="dots-cont">
                        { postTemp?.images?.map((image) =>
                            <p key={`dot-${image.temp_id ? image.temp_id : image.image}`}>•</p>
                        )}
                    </div>
                </div>
                <Button 
                    content={ !isEditing 
                        ? (btnLoading ? "Uploading Post..." : "Upload Post") 
                        : (btnLoading ? "Saving Changes..." : "Save Changes")
                    }
                    onBtnClick={ () => btnPressed(!isEditing) }
                />
            </>;

    return (
        <div className="popup modify-posts-popup">
            <CloseButton setIsClosed={ setIsClosed } />
            { content }
        </div>
    );
}