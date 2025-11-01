from ..extentions import ma
from ..models.document import Document
from marshmallow import fields

class DocumentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Document
        load_instance = True  # deserialize to model instances

    id = ma.auto_field(required=True)
    file_name = ma.auto_field(allow_none=True)
    file_data = fields.Raw(required=True)  # raw bytes
    mime_type = ma.auto_field(required=True)
    document_type = ma.auto_field(allow_none=True)
    author = ma.auto_field(allow_none=True)
    date = ma.auto_field(allow_none=True)
    tags = fields.List(fields.Str(), allow_none=True)
